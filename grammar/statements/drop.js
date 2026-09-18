import { comma_list } from "../helpers.js";

export default {

  _drop_statement: $ => seq(
    choice(
      $.drop_table,
      $.drop_view,
      $.drop_materialized_view,
      $.drop_index,
      $.drop_type,
      $.drop_schema,
      $.drop_database,
      $.drop_role,
      $.drop_sequence,
      $.drop_extension,
      $.drop_function,
      $.drop_procedure,
      $.drop_trigger,
      $.drop_event_trigger,
      $.drop_policy,
      $.drop_rule,
      $.drop_domain,
      $.drop_aggregate,
      $.drop_foreign_table,
      $.drop_owned,
      $.drop_object,
    ),
  ),

  drop_table: $ => seq(
    $.keyword_drop,
    optional($._temporary),
    $.keyword_table,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_view: $ => seq(
    $.keyword_drop,
    $.keyword_view,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_materialized_view: $ => seq(
    $.keyword_drop,
    $.keyword_materialized,
    $.keyword_view,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_schema: $ => seq(
    $.keyword_drop,
    $.keyword_schema,
    optional($._if_exists),
    comma_list($.identifier, true),
    optional($._drop_behavior)
  ),

  drop_database: $ => prec.left(seq(
    $.keyword_drop,
    $.keyword_database,
    optional($._if_exists),
    $.identifier,
    optional($.keyword_with),
    optional($.keyword_force),
  )),

  drop_role: $ => seq(
    $.keyword_drop,
    choice(
      $.keyword_group,
      $.keyword_role,
      $.keyword_user,
    ),
    optional($._if_exists),
    $.identifier,
  ),

  drop_type: $ => seq(
    $.keyword_drop,
    $.keyword_type,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_sequence: $ => seq(
    $.keyword_drop,
    $.keyword_sequence,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_index: $ => seq(
    $.keyword_drop,
    $.keyword_index,
    optional($.keyword_concurrently),
    optional($._if_exists),
    comma_list($._drop_index_name, true),
    optional($._drop_behavior),
    optional(
      seq(
          $.keyword_on,
          $.object_reference,
      ),
    ),
  ),

  drop_extension: $ => seq(
    $.keyword_drop,
    $.keyword_extension,
    optional($._if_exists),
    comma_list($.identifier, true),
    optional(choice($.keyword_cascade, $.keyword_restrict)),
  ),

  drop_function: $ => seq(
    $.keyword_drop,
    $.keyword_function,
    optional($._if_exists),
    comma_list($._drop_routine_target, true),
    optional($._drop_behavior),
  ),

  drop_procedure: $ => seq(
    $.keyword_drop,
    $.keyword_procedure,
    optional($._if_exists),
    comma_list($._drop_routine_target, true),
    optional($._drop_behavior),
  ),

  _drop_index_name: $ => seq(
    optional(
      seq(
        field("schema", $.identifier),
        '.',
      ),
    ),
    field("name", $.identifier),
  ),

  _drop_routine_target: $ => prec.right(seq(
    $.object_reference,
    optional($.function_arguments),
  )),

  // The `ON table` part is mandatory in Postgres and SQL Server DDL triggers
  // use `ON DATABASE`, MySQL and SQLite only take a (qualified) trigger name.
  drop_trigger: $ => prec.right(seq(
    $.keyword_drop,
    $.keyword_trigger,
    optional($._if_exists),
    $.object_reference,
    optional(
      seq(
        $.keyword_on,
        $.object_reference,
      ),
    ),
    optional($._drop_behavior),
  )),

  drop_event_trigger: $ => seq(
    $.keyword_drop,
    $.keyword_event,
    $.keyword_trigger,
    optional($._if_exists),
    $.identifier,
    optional($._drop_behavior),
  ),

  drop_policy: $ => seq(
    $.keyword_drop,
    $.keyword_policy,
    optional($._if_exists),
    $.identifier,
    $.keyword_on,
    $.object_reference,
    optional($._drop_behavior),
  ),

  drop_rule: $ => seq(
    $.keyword_drop,
    $.keyword_rule,
    optional($._if_exists),
    $.identifier,
    $.keyword_on,
    $.object_reference,
    optional($._drop_behavior),
  ),

  drop_domain: $ => seq(
    $.keyword_drop,
    $.keyword_domain,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_aggregate: $ => seq(
    $.keyword_drop,
    $.keyword_aggregate,
    optional($._if_exists),
    comma_list($._drop_routine_target, true),
    optional($._drop_behavior),
  ),

  drop_foreign_table: $ => seq(
    $.keyword_drop,
    $.keyword_foreign,
    $.keyword_table,
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

  drop_owned: $ => seq(
    $.keyword_drop,
    $.keyword_owned,
    $.keyword_by,
    comma_list($.identifier, true),
    optional($._drop_behavior),
  ),

  // objects that are dropped by plain name
  drop_object: $ => seq(
    $.keyword_drop,
    choice(
      $.keyword_publication,
      $.keyword_subscription,
      $.keyword_tablespace,
      $.keyword_collation,
      $.keyword_server,
      $.keyword_event,
    ),
    optional($._if_exists),
    comma_list($.object_reference, true),
    optional($._drop_behavior),
  ),

};
