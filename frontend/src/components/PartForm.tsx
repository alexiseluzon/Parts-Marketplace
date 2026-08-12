import { useState } from "react";
import type { FormEvent } from "react";

interface NewPartInput {
  name: string;
  sku: string;
  price: number;
  quantity: number;
}

export function PartForm({
  onSubmit,
  submitting,
}: {
  onSubmit: (input: NewPartInput) => Promise<void>;
  submitting: boolean;
}) {
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const isValid =
    name.trim().length > 0 &&
    sku.trim().length > 0 &&
    Number(price) > 0 &&
    Number.isInteger(Number(quantity)) &&
    Number(quantity) >= 0;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!isValid) return;
    await onSubmit({ name, sku, price: Number(price), quantity: Number(quantity) });
    setName("");
    setSku("");
    setPrice("");
    setQuantity("");
  }

  return (
    <form className="part-form" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="name">Part name</label>
        <input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="field">
        <label htmlFor="sku">SKU</label>
        <input
          id="sku"
          value={sku}
          onChange={(e) => setSku(e.target.value.toUpperCase())}
          placeholder="BR-100"
          required
        />
      </div>

      <div className="field">
        <label htmlFor="price">Price (USD)</label>
        <input
          id="price"
          type="number"
          min="0.01"
          step="0.01"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
      </div>

      <div className="field">
        <label htmlFor="quantity">Quantity</label>
        <input
          id="quantity"
          type="number"
          min="0"
          step="1"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
        />
      </div>

      <button type="submit" disabled={!isValid || submitting} title="Add this part to inventory">
        {submitting ? "Adding…" : "Add part"}
      </button>
    </form>
  );
}
