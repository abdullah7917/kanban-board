/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "subscription BoardLive($boardId: uuid!) {\n  boards_by_pk(id: $boardId) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n    }\n  }\n}": typeof types.BoardLiveDocument,
    "query BoardByPk($id: uuid!) {\n  boards_by_pk(id: $id) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n      created_at\n    }\n  }\n}\n\nmutation InsertCard($object: cards_insert_input!) {\n  insert_cards_one(object: $object) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation UpdateCard($id: uuid!, $_set: cards_set_input!) {\n  update_cards_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation DeleteCard($id: uuid!) {\n  delete_cards_by_pk(id: $id) {\n    id\n  }\n}": typeof types.BoardByPkDocument,
};
const documents: Documents = {
    "subscription BoardLive($boardId: uuid!) {\n  boards_by_pk(id: $boardId) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n    }\n  }\n}": types.BoardLiveDocument,
    "query BoardByPk($id: uuid!) {\n  boards_by_pk(id: $id) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n      created_at\n    }\n  }\n}\n\nmutation InsertCard($object: cards_insert_input!) {\n  insert_cards_one(object: $object) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation UpdateCard($id: uuid!, $_set: cards_set_input!) {\n  update_cards_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation DeleteCard($id: uuid!) {\n  delete_cards_by_pk(id: $id) {\n    id\n  }\n}": types.BoardByPkDocument,
};

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown;

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "subscription BoardLive($boardId: uuid!) {\n  boards_by_pk(id: $boardId) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n    }\n  }\n}"): (typeof documents)["subscription BoardLive($boardId: uuid!) {\n  boards_by_pk(id: $boardId) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n    }\n  }\n}"];
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(source: "query BoardByPk($id: uuid!) {\n  boards_by_pk(id: $id) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n      created_at\n    }\n  }\n}\n\nmutation InsertCard($object: cards_insert_input!) {\n  insert_cards_one(object: $object) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation UpdateCard($id: uuid!, $_set: cards_set_input!) {\n  update_cards_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation DeleteCard($id: uuid!) {\n  delete_cards_by_pk(id: $id) {\n    id\n  }\n}"): (typeof documents)["query BoardByPk($id: uuid!) {\n  boards_by_pk(id: $id) {\n    id\n    name\n    columns(order_by: {position: asc}) {\n      id\n      name\n      position\n    }\n    cards(order_by: {position: asc}) {\n      id\n      title\n      status\n      position\n      created_at\n    }\n  }\n}\n\nmutation InsertCard($object: cards_insert_input!) {\n  insert_cards_one(object: $object) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation UpdateCard($id: uuid!, $_set: cards_set_input!) {\n  update_cards_by_pk(pk_columns: {id: $id}, _set: $_set) {\n    id\n    title\n    status\n    position\n  }\n}\n\nmutation DeleteCard($id: uuid!) {\n  delete_cards_by_pk(id: $id) {\n    id\n  }\n}"];

export function graphql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;