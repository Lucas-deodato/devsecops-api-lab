import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';

const supportEmail = 'support@example.com';
const supportPassword = 'SupportPassword123!';
const supportPasswordHashRounds = 12;
const defaultCategoryName = 'Hardware';

export async function seed(knex) {
  const existingCategory = await knex('categories')
    .where({ name: defaultCategoryName })
    .first();

  if (!existingCategory) {
    await knex('categories').insert({
      id: randomUUID(),
      name: defaultCategoryName,
      is_active: true,
    });
  }

  const existingSupportUser = await knex('users')
    .where({ email: supportEmail })
    .first();

  if (!existingSupportUser) {
    const passwordHash = await bcrypt.hash(supportPassword, supportPasswordHashRounds);

    await knex('users').insert({
      id: randomUUID(),
      name: 'Support User',
      email: supportEmail,
      password_hash: passwordHash,
      role: 'support',
    });

    return;
  }

  if (existingSupportUser.role !== 'support') {
    await knex('users')
      .where({ email: supportEmail })
      .update({
        role: 'support',
        updated_at: new Date().toISOString(),
      });
  }
}