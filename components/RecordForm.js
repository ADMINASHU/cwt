import styles from "./DataTable.module.css";

export default function RecordForm({
  open,
  mode,
  headers,
  values,
  onChange,
  onSubmit,
  onClose
}) {
  if (!open) return null;
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <h3>{mode === "edit" ? "Edit Record" : "Add Record"}</h3>
        <form onSubmit={onSubmit} className={styles.form}>
          {headers.map((head, i) => (
            <div key={i} className={styles.formGroup}>
              <label className={styles.formLabel}>{head}</label>
              <input
                type="text"
                value={values[head]}
                onChange={e => onChange(head, e.target.value)}
                className={styles.formInput}
              />
            </div>
          ))}
          <div className={styles.formActions}>
            <button type="submit" className={styles.saveButton}>
              Save
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
