
export interface AnyProps {
    [propName: string]:any
}

export interface CommonProps extends AnyProps {
	setTitle: (title:string)=>void
	setDark: (flag:boolean)=>void
	setLang: (lang:string)=>void
}

export interface UserData {
    id           :number    //主键,自增长
	name         :string //用户名
	passwd       :string //密码，默认密码都是1230123
	manage       :number    //是否管理员
	init         :number    //是否初始化 0，1，如果为0强制修改密码
	created_date  :number  //创建时间
	modified_date :number  //修改时间
}

export interface Condtion {
	name:string
	type:string
	value:any
}

export interface Response {
	status:boolean
	data:any
	msg:string
	[propsName:string]:any
}