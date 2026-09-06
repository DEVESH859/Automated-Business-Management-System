const assert = require('node:assert/strict');
const { after, before, test } = require('node:test');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-that-is-not-used-outside-tests';
process.env.NODE_ENV = 'test';

const records = new Map();

class FakeEmployee {
  constructor(data) {
    Object.assign(this, data);
    this._id = `employee-${records.size + 1}`;
  }

  static async findOne({ email }) {
    return records.get(email) || null;
  }

  static findById(id) {
    return {
      select: async () => {
        const employee = [...records.values()].find((entry) => entry._id === id);
        if (!employee) return null;
        return {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
        };
      },
    };
  }

  async save() {
    if (records.has(this.email)) {
      const error = new Error('Duplicate employee');
      error.code = 11000;
      throw error;
    }
    this.password = await bcrypt.hash(this.password, 4);
    records.set(this.email, this);
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

function stubModule(modulePath, exports) {
  const filename = require.resolve(modulePath);
  require.cache[filename] = { id: filename, filename, loaded: true, exports };
}

stubModule('../database', { connectDatabase: async () => ({}) });
stubModule('../models/Employee', FakeEmployee);

const app = require('../app');
let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
});

async function post(path, body) {
  return fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

test('health endpoint reports success', async () => {
  const response = await fetch(`${baseUrl}/api/health`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: 'ok', database: 'connected' });
});

test('registration normalizes email and returns a session', async () => {
  const response = await post('/api/auth/register', {
    name: 'Test User',
    email: ' Test.User@Example.com ',
    password: 'correct-password',
    role: 'staff',
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.employee.email, 'test.user@example.com');
  assert.equal(body.employee.role, 'staff');
  assert.ok(body.token);
});

test('login accepts normalized email and rejects a wrong password', async () => {
  const success = await post('/api/auth/login', {
    email: 'TEST.USER@EXAMPLE.COM',
    password: 'correct-password',
  });
  assert.equal(success.status, 200);
  assert.ok((await success.json()).token);

  const failure = await post('/api/auth/login', {
    email: 'test.user@example.com',
    password: 'wrong-password',
  });
  assert.equal(failure.status, 400);
  assert.equal((await failure.json()).msg, 'Invalid credentials');
});

test('duplicate registration returns a useful message', async () => {
  const response = await post('/api/auth/register', {
    name: 'Duplicate User',
    email: 'test.user@example.com',
    password: 'another-password',
    role: 'staff',
  });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).msg, 'Employee already exists');
});
