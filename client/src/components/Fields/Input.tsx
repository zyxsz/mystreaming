import styles from '../../styles/components/Input.module.css';

export default function Input({ inputRef, ...rest }) {
  return <input ref={inputRef} className={styles.inputContainer} {...rest} />;
}
