  returnOrder:async (req,res,next) => {

      try { 
        const token =req.cookies.token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
          const userId = decoded.id;
          console.log('here2',userId)
    const user = await User.findById(userId)
    console.log('rewq',req.body)
    if(!user){
        return res.status(400).json({success:false,message:'Unauthorized'})
    
    }


        console.log('rew',req.params)
        const orderId = req.params.orderId
        const {returnReason}=req.body
        if(!orderId){
            return res.status(400).json({success:false,message:'invalid input'})
                }
      
            
                const order = await Order.findOne({orderId}).populate('items.product')
      
                if(!order){
                  return res.status(404).json({success:false,message:'Order not found'})
                }
             
                              
                
                                
                                order.returnReason=returnReason
                                order.orderStatus="return request"
                                await order.save()

                

                return res.status(200).json({success:true,message:'Order return request successfully'})
            }catch(error){
                next(error)
            }


      }