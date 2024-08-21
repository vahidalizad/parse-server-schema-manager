export async function createSchema(className) {
  try {
    const schema = new Parse.Schema(className || 'Test');
    schema.addString('name');
    schema.addNumber('age');
    return schema;
  } catch (error) {
    console.error('Failed to create schema:', error);
    throw error;
  }
}
export async function createUserSchema() {
  const UserSchema = new Parse.Schema('_User');
  UserSchema.add('ACL', new Parse.ACL());
  UserSchema.add('createdAt', new Date());
  UserSchema.add('email', new Parse.String());
  UserSchema.add('emailVerified', new Parse.Boolean());
  UserSchema.add('objectId', new Parse.String());
  UserSchema.add('password', new Parse.String());
  UserSchema.add('updatedAt', new Date());
  UserSchema.add('username', new Parse.String());
  UserSchema.add('authData', new Parse.Object());

  UserSchema.indexes().addIndex('email', true); // case_insensitive_email
  UserSchema.indexes().addIndex('username', true); // case_insensitive_username

  try {
    await UserSchema.save();
    return UserSchema;
  } catch (error) {
    console.error('Failed to create/update User schema:', error);
  }
}

export async function createRoleSchema() {
  const RoleSchema = new Parse.Schema('_Role');
  RoleSchema.add('objectId', new Parse.String());
  RoleSchema.add('createdAt', new Date());
  RoleSchema.add('updatedAt', new Date());
  RoleSchema.add('ACL', new Parse.ACL());
  RoleSchema.add('name', new Parse.String());
  RoleSchema.add('users', new Parse.Relation({targetClass: '_User'}));
  RoleSchema.add('roles', new Parse.Relation({targetClass: '_Role'}));

  RoleSchema.indexes().addIndex('name', true); // name_1

  try {
    await RoleSchema.save();
    return RoleSchema;
  } catch (error) {
    console.error('Failed to create/update Role schema:', error);
  }
}
