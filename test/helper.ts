import Parse from 'parse/node';

type Props = {
  className: string;
};

export async function saveToDatabase({
  className,
}: Props): Promise<Parse.Object[] | []> {
  const classObject = Parse.Object.extend(className);
  const newData = new classObject();
  newData.set('name', 'John Doe');
  newData.set('age', 23);
  newData.set('email', 'John@Doe.com');
  await newData.save();

  const classData = await new Parse.Query(className).find();
  return classData;
}
