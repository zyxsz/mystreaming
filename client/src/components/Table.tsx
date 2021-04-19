import styles from '../styles/components/Table.module.css';
import AnimatedNumber from 'react-animated-number';
import { useEffect, useState } from 'react';

export default function Table({ columns, data }) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((column, idx) => (
            <th key={idx}>{column}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx}>
            {row.map((column, idx) => (
              <>
                {column.type === 'text' && (
                  <td className={column.flex && styles.tableFlex}>
                    {column.Icon && (
                      <column.Icon
                        style={column.iconColor && { color: column.iconColor }}
                      />
                    )}
                    {column.value}
                  </td>
                )}
                {column.type === 'animatedNumber' && (
                  <AnimatedValue value={parseFloat(column.value)} />
                )}
                {column.type === 'button' && (
                  <td>
                    <a>{column.value}</a>
                  </td>
                )}
              </>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function AnimatedValue({ value }) {
  const [number, setNumber] = useState(0);

  useEffect(() => {
    setNumber(value);
    console.log(typeof value, typeof number);
  }, [value]);

  const formatValue = (value) => `${Number(value).toFixed(2)}%`;

  return (
    <AnimatedNumber
      style={{
        transition: '0.8s ease-out',
        transitionProperty: 'background-color, color, opacity',
      }}
      duration={1500}
      value={number}
      component="td"
      formatValue={formatValue}
    />
  );
}
