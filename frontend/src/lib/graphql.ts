import { gql } from "@apollo/client";

export const ME = gql`
  query Me {
    me {
      id
      email
    }
  }
`;

export const REGISTER = gql`
  mutation Register($email: String!, $password: String!) {
    register(email: $email, password: $password) {
      user {
        id
        email
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      user {
        id
        email
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;

export const PARTS = gql`
  query Parts {
    parts {
      id
      name
      sku
      price
      quantity
      ownerId
    }
  }
`;

export const CREATE_PART = gql`
  mutation CreatePart($name: String!, $sku: String!, $price: Float!, $quantity: Int!) {
    createPart(name: $name, sku: $sku, price: $price, quantity: $quantity) {
      id
      name
      sku
      price
      quantity
      ownerId
    }
  }
`;

export const UPDATE_PART = gql`
  mutation UpdatePart($id: ID!, $name: String, $price: Float, $quantity: Int) {
    updatePart(id: $id, name: $name, price: $price, quantity: $quantity) {
      id
      name
      price
      quantity
    }
  }
`;

export const DELETE_PART = gql`
  mutation DeletePart($id: ID!) {
    deletePart(id: $id)
  }
`;

// --- TS types matching backend schema ---
export interface User {
  id: string;
  email: string;
}

export interface Part {
  id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  ownerId: string;
}
