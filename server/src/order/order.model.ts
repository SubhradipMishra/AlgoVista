
import mongoose, {model, Schema} from "mongoose";
const OrderSchema = new Schema({

    user:{
        type:mongoose.Types.ObjectId,
        ref:"User",
        required:true,
    },
    product:{
        type:mongoose.Types.ObjectId,
        ref:"Product",
        required:true,
    },
    paymentId:{
        type:String,
        required:true,
    },
    discount:{
       type:Number,
       default:0 
    }
},{timestamps:true}) ;


const OrderModel = model("Order",OrderSchema) ;
export default  OrderModel;