import styles from '../styles/components/LoginButton.module.css';

export default function LoginButton({ children, ...rest }) {
  return (
    <a className={styles.loginButton} {...rest}>
      {children}
    </a>
  );
}
