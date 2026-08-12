import gql from "graphql-tag";

export const typeDefs = gql`
  type User {
    id: ID!
    email: String!
  }

  type Part {
    id: ID!
    name: String!
    sku: String!
    price: Float!
    quantity: Int!
    ownerId: ID!
  }

  type AuthPayload {
    user: User!
  }

  type Query {
    me: User
    parts: [Part!]!
    part(id: ID!): Part
  }

  type Mutation {
    register(email: String!, password: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!

    createPart(name: String!, sku: String!, price: Float!, quantity: Int!): Part!
    updatePart(id: ID!, name: String, price: Float, quantity: Int): Part!
    deletePart(id: ID!): Boolean!
  }
`;
