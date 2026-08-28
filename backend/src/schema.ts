import gql from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
    role: String!
  }

  type Part {
    id: ID!
    name: String!
    sku: String!
    price: Float!
    quantity: Int!
    ownerId: ID!
  }

  type Query {
    me: User
    parts: [Part!]!
    part(id: ID!): Part
  }

  type Mutation {
    createPart(name: String!, sku: String!, price: Float!, quantity: Int!): Part!
    updatePart(id: ID!, name: String, price: Float, quantity: Int): Part!
    deletePart(id: ID!): Boolean!
  }
`;
