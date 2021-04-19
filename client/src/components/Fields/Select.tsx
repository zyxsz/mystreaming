import styles from '../../styles/components/Select.module.css';
import Select from 'react-dropdown-select';

export default function SelectComponent({
  className = null,
  values = [],
  dropdownHandle = false,
  labelField = 'label',
  valueField = 'id',
  searchBy = 'label',
  ...rest
}: any) {
  return (
    <Select
      className={className || styles.Select}
      values={values}
      dropdownHandle={dropdownHandle}
      labelField={labelField}
      valueField={valueField}
      searchBy={searchBy}
      {...rest}
    />
  );
}
