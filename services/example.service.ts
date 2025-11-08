import db from '@/db/client';

/**
 * Example service showing how to use the database client
 */
export class ExampleService {
  /**
   * Get all Foo records
   */
  async getAllFoos() {
    return await db.foo.findMany();
  }

  /**
   * Get a single Foo by ID
   */
  async getFooById(id: number) {
    return await db.foo.findUnique({
      where: { id },
    });
  }

  /**
   * Create a new Foo
   */
  async createFoo(name: string) {
    return await db.foo.create({
      data: { name },
    });
  }

  /**
   * Update a Foo
   */
  async updateFoo(id: number, name: string) {
    return await db.foo.update({
      where: { id },
      data: { name },
    });
  }

  /**
   * Delete a Foo
   */
  async deleteFoo(id: number) {
    return await db.foo.delete({
      where: { id },
    });
  }
}

// Export a singleton instance
export const exampleService = new ExampleService();


