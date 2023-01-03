import Document from './document';

export interface IDatabase {
  admins: Document;
  addresses: Document;
  users: Document;
}
