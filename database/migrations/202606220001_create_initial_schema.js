function addTimestamps(table, knex) {
  table
    .timestamp('created_at', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());

  table
    .timestamp('updated_at', { useTz: true })
    .notNullable()
    .defaultTo(knex.fn.now());
}

export async function up(knex) {
  await knex.schema.createTable('users', (table) => {
    table.uuid('id').primary();
    table.string('name', 120).notNullable();
    table.string('email', 254).notNullable().unique();
    table.string('password_hash', 255).notNullable();

    table
      .string('role', 20)
      .notNullable()
      .checkIn(['employee', 'support'], 'users_role_check');

    addTimestamps(table, knex);
  });

  await knex.schema.createTable('categories', (table) => {
    table.uuid('id').primary();
    table.string('name', 80).notNullable().unique();
    table.boolean('is_active').notNullable().defaultTo(true);

    addTimestamps(table, knex);
  });

  await knex.schema.createTable('tickets', (table) => {
    table.uuid('id').primary();
    table.string('title', 150).notNullable();
    table.text('description').notNullable();

    table
      .string('status', 20)
      .notNullable()
      .defaultTo('OPEN')
      .checkIn(
        ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CANCELLED'],
        'tickets_status_check',
      );

    table
      .string('priority', 20)
      .notNullable()
      .defaultTo('MEDIUM')
      .checkIn(
        ['LOW', 'MEDIUM', 'HIGH'],
        'tickets_priority_check',
      );

    table.uuid('creator_id').notNullable();
    table.uuid('assignee_id').nullable();
    table.uuid('category_id').notNullable();
    table.timestamp('resolved_at', { useTz: true }).nullable();

    addTimestamps(table, knex);

    table
      .foreign('creator_id')
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table
      .foreign('assignee_id')
      .references('id')
      .inTable('users')
      .onDelete('SET NULL');

    table
      .foreign('category_id')
      .references('id')
      .inTable('categories')
      .onDelete('RESTRICT');

    table.index('creator_id', 'tickets_creator_id_index');
    table.index('assignee_id', 'tickets_assignee_id_index');
    table.index('category_id', 'tickets_category_id_index');
    table.index('status', 'tickets_status_index');
  });

  await knex.schema.createTable('ticket_history', (table) => {
    table.uuid('id').primary();
    table.uuid('ticket_id').notNullable();
    table.uuid('actor_id').notNullable();
    table.string('action', 50).notNullable();
    table.text('old_value').nullable();
    table.text('new_value').nullable();

    table
      .timestamp('created_at', { useTz: true })
      .notNullable()
      .defaultTo(knex.fn.now());

    table
      .foreign('ticket_id')
      .references('id')
      .inTable('tickets')
      .onDelete('CASCADE');

    table
      .foreign('actor_id')
      .references('id')
      .inTable('users')
      .onDelete('RESTRICT');

    table.index('ticket_id', 'ticket_history_ticket_id_index');
  });
}

export async function down(knex) {
  await knex.schema.dropTableIfExists('ticket_history');
  await knex.schema.dropTableIfExists('tickets');
  await knex.schema.dropTableIfExists('categories');
  await knex.schema.dropTableIfExists('users');
}