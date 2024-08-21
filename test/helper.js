export async function createSchema(className = 'Test') {
  try {
    const schema = new Parse.Schema(className);
    schema.addString('name');
    schema.addNumber('age');
    return schema.save();
  } catch (error) {
    console.error('Failed to create schema:', error);
    throw error;
  }
}
