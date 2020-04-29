# 每周总结可以写在这里
# 表达式，类型转换
## Javascript语句
- Atom (Grammer&&Runtime)
- Expression
- Statement
- Structure
- Program/Module

## 类型判断
- typeof
- Obejct.prototype.toString.call
- instanceof

## 简单语句&&组合语句
- 表达式 空语句 Debugger语句 循环
- while() / do...while / for

## Statement  ~Declaration
- Function~
- Generator~
- AsyncFunction~
- AsyncGenerator~
- VariableStatemency
- Class~
- Lexical~

## 标签、循环、break、continue
- LabelledStatement
- IterationStatement
- ContinueStatement
- BreakStatement
- SwitchStatement

## throw的statement
- throw
- await
- ExpressionStatement

## Runtime
- Complection Record
	- [[type]]: normal, break, continue, return, throw
	- [[value]]: Types
	- [[target]]: label
- Lexical Enviorment

## 作用域和上下文
- 作用域：源码中文本的范围
- 上下文：JS引擎中内存变量的地方

# 语句，对象

## 对象机制
- 对象是唯一的，与状态无关
- 状态一致的对象不相等
- 行为=状态的改变
- 用状态描述对象
- 面向对象的子系统——继承

## 对象三要素
- state
- behavior
- identifier

## JavaScript中的对象
- 原生对象（原型&&属性）
- 原型实际上是KV对
- 属性来统一抽象对象状态和行为
- 数据属性——描述状态 || 访问器属性描述行为
- 数据属性中存储函数也可以用于描述行为

---

- 抽象对象时，应该遵循‘行为改变状态’的原则，行为改变自身状态。
- 不应该按照语言描述的行为进行设计

---

##函数对象
- 函数对象=一般对象的属性和原型+行为
- 行为=Function关键字、箭头运算符和Function构造器创建的对象
