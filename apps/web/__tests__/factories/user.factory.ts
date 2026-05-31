import { faker } from '@faker-js/faker';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
  isActive?: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date | null;
}

export function createUserFactory(overrides: Partial<User> = {}): User {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const createdAt = faker.date.past();
  
  return {
    id: faker.string.uuid(),
    email: faker.internet.email({ firstName, lastName }),
    firstName,
    lastName,
    role: 'user',
    isActive: true,
    createdAt,
    updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    deletedAt: null,
    ...overrides,
  };
}

export function createAdminUserFactory(overrides: Partial<User> = {}): User {
  return createUserFactory({
    role: 'admin',
    email: `admin+${faker.string.alphanumeric(5)}@example.com`,
    ...overrides,
  });
}

export function createInactiveUserFactory(overrides: Partial<User> = {}): User {
  return createUserFactory({
    isActive: false,
    deletedAt: faker.date.recent(),
    ...overrides,
  });
}

// Batch factory functions
export function createUsersFactory(count: number, overrides: Partial<User> = {}): User[] {
  return Array.from({ length: count }, () => createUserFactory(overrides));
}

// Factory for specific test scenarios
export function createTestUserScenarios() {
  return {
    validUser: createUserFactory(),
    adminUser: createAdminUserFactory(),
    inactiveUser: createInactiveUserFactory(),
    userWithLongName: createUserFactory({
      firstName: 'VeryLongFirstNameThatExceedsTypicalLength',
      lastName: 'VeryLongLastNameThatExceedsTypicalLength',
    }),
    userWithSpecialCharacters: createUserFactory({
      firstName: "D'Angelo",
      lastName: 'O\'Brien-Smith',
    }),
  };
}