"use client";

import { useEffect, useState } from "react";
import styles from "./DataTable.module.css";
import RecordForm from "./RecordForm";

export default function DataTable() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("edit"); // "edit" or "add"
  const [formValues, setFormValues] = useState({});
  const [editRowIndex, setEditRowIndex] = useState(null);
  const [fontSize, setFontSize] = useState(16);

  useEffect(() => {
    fetch("/api/sheet")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  if (!data.length) return <p>Loading...</p>;

  const headers = data[0];
  const rows = data.slice(1);

  const headerMap = headers.reduce((map, name, i) => {
    map[name.toLowerCase()] = i;
    return map;
  }, {});

  const getUniqueOptions = (field) => {
    const index = headerMap[field.toLowerCase()];
    return [...new Set(rows.map((row) => row[index]))].sort();
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const filteredRows = rows
    .filter((row) => row.some((cell) => cell.toLowerCase().includes(query.toLowerCase())))
    .filter((row) =>
      Object.entries(filters).every(([key, value]) => {
        const index = headerMap[key.toLowerCase()];
        return value === "" || row[index] === value;
      })
    );

  const filterFields = [
    "State",
    "Organization",
    "Product",
    "Rating",
    "SYS Warr",
    "Battery Warr",
    "AMC",
  ];

  // Modal logic
  const openEditModal = (rowIndex) => {
    setModalMode("edit");
    setEditRowIndex(rowIndex);
    setFormValues(
      headers.reduce((obj, head, i) => {
        obj[head] = filteredRows[rowIndex][i];
        return obj;
      }, {})
    );
    setModalOpen(true);
  };

  const openAddModal = () => {
    setModalMode("add");
    setEditRowIndex(null);
    setFormValues(
      headers.reduce((obj, head) => {
        obj[head] = "";
        return obj;
      }, {})
    );
    setModalOpen(true);
  };

  const handleFormChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (modalMode === "edit") {
      // Update row in local data
      const updatedRows = [...rows];
      const filteredIdx = rows.findIndex((row) =>
        row.every((cell, i) => cell === filteredRows[editRowIndex][i])
      );
      const newRow = headers.map((h) => formValues[h]);
      updatedRows[filteredIdx] = newRow;
      setData([headers, ...updatedRows]);

      // Send only the updated row to API using PUT
      try {
        await fetch("/api/sheet", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rowIndex: filteredIdx, rowData: newRow }),
        });
      } catch (err) {
        console.error("Error saving changes:", err);
      }
    } else {
      // Add new row locally
      const newRow = headers.map((h) => formValues[h]);
      setData([headers, ...rows, newRow]);

      // Send new row to API
      try {
        await fetch("/api/sheet", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ updates: [newRow] }),
        });
      } catch (err) {
        console.error("Error adding row:", err);
      }
    }
    setModalOpen(false);
  };

  const handleModalClose = () => {
    setModalOpen(false);
  };

  return (
    <div className={styles.container} style={{ fontSize: `${fontSize}px` }}>
      <div className={styles.bar}>
        <h2 className={styles.title}>📋 Customer's Records</h2>
        <div className={styles.inputGroup}>
          {/* Font size controller */}
          <button
            type="button"
            className={styles.fontSizeBtn}
            aria-label="Decrease font size"
            onClick={() => setFontSize((f) => Math.max(12, f - 1))}
          >
            A-
          </button>
          <button
            type="button"
            className={styles.fontSizeBtn}
            aria-label="Increase font size"
            onClick={() => setFontSize((f) => Math.min(24, f + 1))}
          >
            A+
          </button>
          <input
            type="text"
            placeholder="🔍 Search across all columns"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className={styles.search}
          />
          <button type="button" className={styles.addButton} onClick={openAddModal}>
            + Add
          </button>
        </div>
      </div>

      <div className={styles.filters}>
        {filterFields.map((field) => (
          <select
            key={field}
            value={filters[field] || ""}
            onChange={(e) => handleFilterChange(field, e.target.value)}
            className={styles.filter}
          >
            <option value="">{field}</option>
            {getUniqueOptions(field).map((option, i) => (
              <option key={i} value={option}>
                {option}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className={styles.responsiveTableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {headers.map((head, i) => (
                <th key={i}>{head}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={styles.clickableRow}
                onClick={() => openEditModal(rowIndex)}
                style={{ cursor: "pointer" }}
              >
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <RecordForm
          open={modalOpen}
          mode={modalMode}
          headers={headers}
          values={formValues}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
}
