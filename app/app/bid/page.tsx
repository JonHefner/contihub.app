import type { Metadata } from "next";
import { CrudBoard } from "@/components/crud-board";
import { listBidChases } from "@/lib/suite/store";
import { createChase, removeChase, updateChase } from "./actions";

export const metadata: Metadata = {
  title: "Conti Bid",
};

const statuses = ["Tracking", "In Progress", "Submitted", "Awarded", "Lost", "No Bid"];

export default async function BidPage() {
  const { rows, persist } = await listBidChases();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <CrudBoard
      eyebrow="Conti Bid"
      title="Bid chase list"
      description="Watch invitations through award — project, due date, status, and estimate value."
      addLabel="Add bid"
      editLabel="Edit bid"
      emptyTitle="No bids on the board"
      emptyBody="Add a project to chase. Takeoff and proposal workflow can grow from this list."
      persist={persist}
      fields={[
        { name: "project", label: "Project", type: "text", required: true, placeholder: "Bid name or owner" },
        { name: "dueDate", label: "Due date", type: "date", required: true },
        { name: "status", label: "Status", type: "select", required: true, options: statuses },
        { name: "estimateValue", label: "Estimate value", type: "number", required: true, min: 0, step: "0.01" },
      ]}
      columns={[
        { key: "project", label: "Project", format: "emphasis" },
        { key: "dueDate", label: "Due date", format: "date" },
        { key: "status", label: "Status", format: "badge" },
        { key: "estimateValue", label: "Estimate", format: "money" },
      ]}
      rows={rows}
      defaults={{ project: "", dueDate: today, status: "Tracking", estimateValue: "0" }}
      createAction={createChase}
      updateAction={updateChase}
      deleteAction={removeChase}
    />
  );
}
