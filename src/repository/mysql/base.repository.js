import { pool } from '../../config/mysql.js';
export class BaseMySQLRepository {
  constructor() {
    this.pool = pool;
  }
}
