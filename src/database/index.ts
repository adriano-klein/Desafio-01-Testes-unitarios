import { createConnection, getConnectionOptions, Connection } from 'typeorm';

export default async(host = "db_desafio_finapi"): Promise<Connection> => {
  const defaultOptions = await getConnectionOptions();
  console.log(defaultOptions.database)
  return createConnection(

    Object.assign(defaultOptions, {
      host: process.env.NODE_ENV === 'test' ? 'localhost' : host,
      database:
      process.env.NODE_ENV === 'test'
      ? 'db_desafio_finapi_test'
      : defaultOptions.database
      })
      )
}


