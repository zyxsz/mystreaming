import styles from '../../styles/components/FieldSet.module.css';

export default function FieldSet({ children = null }) {
  return <fieldset className={styles.fieldSetContainer}>{children}</fieldset>;
}
