import {model,Schema} from "mongoose" 

const  schema = new Schema({
	
},{timestamps:true})

const PaymentModel = model('Payment',schema)

export default PaymentModel