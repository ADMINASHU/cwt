"use client";

import { useEffect, useState } from "react";
import styles from "./DataTable.module.css";

export default function DataTable() {
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetch("/api/sheet")
      .then((res) => res.json())
      .then((json) => setData(json.data))
      .catch((err) => console.error("Error fetching data:", err));
  }, []);

  if (!data.length) return <p>Loading...</p>;

  const headers = data[0];
  const rows = data.slice(1);

  // Map header names to their indices
  const headerMap = headers.reduce((map, name, i) => {
    map[name.toLowerCase()] = i;
    return map;
  }, {});

  // Get unique values for each field
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
    "Customer Name",
    "Product",
    "Rating",
    "SYS Warr",
    "Battery Warr",
    "AMC",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>📋 Customer's Records</h2>

        {/* Global Search */}
        <input
          type="text"
          placeholder="🔍 Search across all columns"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className={styles.search}
        />
      </div>

      {/* Dropdown Filters */}
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

      {/* Table */}
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
              <tr key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
