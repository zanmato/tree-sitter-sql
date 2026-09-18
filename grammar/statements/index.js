import { optional_parenthesis, paren_list, wrapped_in_parenthesis } from "../helpers.js";

import create_rules from "./create.js";
import alter_rules from "./alter.js";
import drop_rules from "./drop.js";
import rename_rules from "./rename.js";
import optimize_rules from "./optimize.js";
import merge_rules from "./merge.js";
import comment_rules from "./comment.js";
import delete_rules from "./delete.js";
import insert_rules from "./insert.js";
import update_rules from "./update.js";
import truncate_rules from "./truncate.js";
import copy_rules from "./copy.js";
import select_rules from "./select.js";
import set_rules from "./set.js";
import refresh_rules from "./refresh.js";
import grant_rules from "./grant.js";
import utility_rules from "./utility.js";

export default {

  block: $ => prec.dynamic(1, seq(
    $.keyword_begin,
    optional(';'),
    repeat(
      seq(
        $.statement,
        ';'
      ),
    ),
    $.keyword_end,
  )),

  statement: $ => seq(
    optional(seq(
      $.keyword_explain,
      choice(
        seq(
          optional($.keyword_analyze),
          optional($.keyword_verbose),
        ),
        paren_list($.explain_option, true),
      ),
    )),
    choice(
      $._ddl_statement,
      $._dml_write,
      optional_parenthesis($._dml_read),
      $.while_statement,
      $.savepoint_statement,
      $.grant_statement,
      $.revoke_statement,
      $.call_statement,
      $.use_statement,
      $.describe_statement,
      $.pragma_statement,
      $.values,
      $._utility_statement,
    ),
  ),

  // Postgres `EXPLAIN (ANALYZE, FORMAT JSON)`
  explain_option: $ => seq(
    field(
      'name',
      choice(
        $.identifier,
        $.keyword_analyze,
        $.keyword_verbose,
        $.keyword_format,
      ),
    ),
    optional(
      field(
        'value',
        choice(
          $.literal,
          $.identifier,
          $.keyword_on,
          $.keyword_off,
          $.keyword_json,
          $.keyword_xml,
          $.keyword_text,
        ),
      ),
    ),
  ),

  call_statement: $ => prec.right(seq(
    $.keyword_call,
    choice(
      $.invocation,
      $.object_reference,
    ),
  )),

  use_statement: $ => seq(
    $.keyword_use,
    $.identifier,
  ),

  describe_statement: $ => seq(
    choice($.keyword_describe, $.keyword_desc),
    $.object_reference,
  ),

  // SQLite
  pragma_statement: $ => prec.right(seq(
    $.keyword_pragma,
    $.object_reference,
    optional(
      choice(
        seq('=', $._pragma_value),
        seq('(', $._pragma_value, ')'),
      ),
    ),
  )),

  _pragma_value: $ => choice(
    $.literal,
    $.identifier,
    $.keyword_on,
    $.keyword_off,
    $.keyword_full,
    $.keyword_none,
    $.keyword_default,
  ),

  while_statement: $ => prec.left(seq(
    $.keyword_while,
    optional_parenthesis($._expression),
    choice(
      seq(
        $.statement,
        optional(';'),
      ),
      seq(
        $.keyword_begin,
        repeat($.statement),
        $.keyword_end,
      ),
    ),
  )),

  var_declarations: $ => seq($.keyword_declare, repeat1($.var_declaration)),
  var_declaration: $ => seq(
    $.identifier,
    $._type,
    optional(
      seq(
        choice($.keyword_default, '='),
        $.literal,
      ),
    ),
    optional(','),
  ),

  _ddl_statement: $ => choice(
    $._create_statement,
    $._alter_statement,
    $._drop_statement,
    $._rename_statement,
    $._optimize_statement,
    $._merge_statement,
    $._refresh_statement,
    $.comment_statement,
    $.set_statement,
    $.reset_statement,
  ),

  ...create_rules,
  ...alter_rules,
  ...drop_rules,
  ...rename_rules,
  ...optimize_rules,
  ...merge_rules,
  ...refresh_rules,
  ...comment_rules,
  ...grant_rules,
  ...utility_rules,

  _dml_write: $ => seq(
    seq(
      optional(
        $._cte,
      ),
      choice(
        $._delete_statement,
        $._insert_statement,
        $._update_statement,
        $._truncate_statement,
        $._copy_statement,
      ),
    ),
  ),

  ...delete_rules,
  ...insert_rules,
  ...update_rules,
  ...truncate_rules,
  ...copy_rules,

  _dml_read: $ => seq(
    optional(optional_parenthesis($._cte)),
    optional_parenthesis(
      choice(
        $._select_statement,
        $.set_operation,
        $._show_statement,
        $._unload_statement,
      ),
    ),
  ),

  ...select_rules,
  ...set_rules,

  _show_statement: $ => seq(
    $.keyword_show,
    choice(
      $._show_create,
      $.keyword_all, // Postgres
      $._show_tables, // trino/presto
      $._show_object,
    ),
  ),

  _show_create: $ => seq(
    $.keyword_create,
    choice(
      // Trino/Presto/MySQL
      $.keyword_schema,
      $.keyword_table,
      seq(optional($.keyword_materialized), $.keyword_view),
      // MySQL
      $.keyword_user,
      $.keyword_trigger,
      $.keyword_procedure,
      $.keyword_function
    ),
    $.object_reference
  ),

  // Postgres `SHOW search_path` and the MySQL family `SHOW COLUMNS FROM t`
  _show_object: $ => prec.right(seq(
    choice(
      $.object_reference,
      $.keyword_index,
      $.keyword_schemas,
      $.keyword_functions,
      $.keyword_privileges,
    ),
    optional(
      seq(
        choice($.keyword_from, $.keyword_in),
        $.object_reference,
      ),
    ),
    optional(
      choice(
        seq($.keyword_like, $._expression),
        $.where,
      ),
    ),
  )),

  _show_tables: $ => seq(
    $.keyword_tables,
    optional(seq($.keyword_from, $._qualified_field)),
    optional(seq($.keyword_like, $._expression))
  ),

  // athena
  _unload_statement: $ => seq(
    $.keyword_unload,
    wrapped_in_parenthesis($._select_statement),
    $.keyword_to,
    $._single_quote_string,
    $.storage_parameters,
  ),

};
