### 匹配 String
```
/[\u0021-\u007E]{6,16}|[\x21-\x7E]{6,16}|(['"])(?:(?!\1).)*?\1/g
```

### 匹配所有 Number
```
/^(-?[0-9]+)| ([-+]?[0-9]*\.?[0-9]+) | ([01]+) | ([0-7]+\) |(0x[a-f0-9]{1,2}$)|(^0X[A-F0-9]{1,2}$)|(^[A-F0-9]{1,2}$)|(^[a-f0-9]{1,2})$/g
```

### UTF-8 Encoding 函数
```
function UTF8Encoding(str) {
  return str
    .split('')
    .map((s) => `\\u${s.charCodeAt().toString(16)}`)
    .join('')
}
```