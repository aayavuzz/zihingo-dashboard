"use client";

import { useState } from "react";
import { badgeLabels, inputClass, labelClass } from "@/components/ui";

export function LeadStatusFields({
  statusOptions,
  typeOptions,
  defaultStatus,
  defaultType,
  defaultCallDate = "",
  defaultCallTime = "",
}: {
  statusOptions: string[];
  typeOptions: string[];
  defaultStatus: string;
  defaultType: string;
  defaultCallDate?: string;
  defaultCallTime?: string;
}) {
  const [status, setStatus] = useState(defaultStatus);

  return (
    <>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Durum</label>
          <select
            name="status"
            className={inputClass}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {badgeLabels[s] ?? s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelClass}>Kategori</label>
          <select name="type" className={inputClass} defaultValue={defaultType}>
            {typeOptions.map((t) => (
              <option key={t} value={t}>
                {badgeLabels[t] ?? t}
              </option>
            ))}
          </select>
        </div>
      </div>
      {status === "Aranacak" && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Aranma Tarihi</label>
            <input
              type="date"
              name="callDate"
              defaultValue={defaultCallDate}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Aranma Saati</label>
            <input
              type="time"
              name="callTime"
              defaultValue={defaultCallTime}
              className={inputClass}
            />
          </div>
        </div>
      )}
    </>
  );
}
