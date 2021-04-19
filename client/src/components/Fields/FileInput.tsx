import styles from '../../styles/components/FileInput.module.css';

export default function FileInput({ children, handleChange, file }) {
  function handleInputChange(e) {
    const file = e.target.files[0];
    handleChange(file);
  }

  return (
    <label className={styles.fileInputContainer} htmlFor="upload">
      {file ? (
        <>
          <p>{file.name}</p>
        </>
      ) : (
        <p>{children}</p>
      )}
      <input
        type="file"
        accept="video/*,.mkv"
        id="upload"
        onChange={handleInputChange}
      />
    </label>
  );
}
