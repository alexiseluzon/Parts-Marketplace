import { useState } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { PARTS, CREATE_PART, UPDATE_PART, DELETE_PART } from "../lib/graphql";
import type { Part } from "../lib/graphql";
import { useAuth } from "../context/AuthContext";
import { PartForm } from "../components/PartForm";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { Toast } from "../components/Toast";

export function PartsPage() {
  const { user, logout } = useAuth();
  const { data, loading, error, refetch } = useQuery(PARTS);
  const [createPart, { loading: creating }] = useMutation(CREATE_PART);
  const [updatePart] = useMutation(UPDATE_PART);
  const [deletePart] = useMutation(DELETE_PART);

  const [pendingDelete, setPendingDelete] = useState<Part | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  async function handleCreate(input: { name: string; sku: string; price: number; quantity: number }) {
    setActionError(null);
    try {
      await createPart({ variables: input });
      await refetch();
      setToastMsg(`Added ${input.name} (${input.sku})`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to add part");
    }
  }

  async function handleAdjustQuantity(part: Part, delta: number) {
    const nextQty = part.quantity + delta;
    if (nextQty < 0) return;
    setActionError(null);
    try {
      await updatePart({ variables: { id: part.id, quantity: nextQty } });
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to update part");
    }
  }

  async function confirmDelete() {
    if (!pendingDelete) return;
    setActionError(null);
    try {
      await deletePart({ variables: { id: pendingDelete.id } });
      setPendingDelete(null);
      await refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Failed to delete part");
      setPendingDelete(null);
    }
  }

  return (
    <div className="parts-page">
      <header className="topbar">
        <p className="eyebrow">Parts Marketplace</p>
        <div className="topbar-right">
          <span className="user-email">{user?.email}</span>
          <button type="button" className="btn-ghost" onClick={logout} title="Sign out of your account">
            Sign out
          </button>
        </div>
      </header>

      <main>
        <section className="add-part-section">
          <h2>Add a part</h2>
          <PartForm onSubmit={handleCreate} submitting={creating} />
        </section>

        <section className="inventory-section">
          <h2>Inventory</h2>

          {actionError && (
            <p className="form-error" role="alert">
              {actionError}
            </p>
          )}

          {loading && <p className="status-text">Loading inventory…</p>}
          {error && (
            <p className="status-text status-error" role="alert">
              Could not load parts: {error.message}
            </p>
          )}

          {data?.parts.length === 0 && (
            <p className="status-text">No parts yet. Add the first one above.</p>
          )}

          {data?.parts.length > 0 && (
            <table className="parts-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Qty</th>
                  <th aria-label="Actions"></th>
                </tr>
              </thead>
              <tbody>
                {data.parts.map((part: Part) => {
                  const isOwner = part.ownerId === user?.id;
                  return (
                    <tr key={part.id}>
                      <td className="sku-cell">{part.sku}</td>
                      <td>{part.name}</td>
                      <td>${part.price.toFixed(2)}</td>
                      <td>
                        <div className="qty-controls">
                          <button
                            type="button"
                            className="btn-icon"
                            disabled={!isOwner || part.quantity === 0}
                            onClick={() => handleAdjustQuantity(part, -1)}
                            title={isOwner ? "Decrease quantity" : "Only the owner can edit this part"}
                            aria-label="Decrease quantity"
                          >
                            −
                          </button>
                          <span className="qty-value">{part.quantity}</span>
                          <button
                            type="button"
                            className="btn-icon"
                            disabled={!isOwner}
                            onClick={() => handleAdjustQuantity(part, 1)}
                            title={isOwner ? "Increase quantity" : "Only the owner can edit this part"}
                            aria-label="Increase quantity"
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="btn-danger-ghost"
                          disabled={!isOwner}
                          onClick={() => setPendingDelete(part)}
                          title={isOwner ? "Delete this part" : "Only the owner can delete this part"}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </section>
      </main>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete part?"
        message={`This will permanently remove "${pendingDelete?.name}" (${pendingDelete?.sku}) from inventory.`}
        onConfirm={confirmDelete}
        onCancel={() => setPendingDelete(null)}
      />
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}
