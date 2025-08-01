import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()
.use(auth.verifyToken)
.post('/profitPaths', controller.profitPaths)
.post('/filterProfitPaths',controller.filterProfitPaths)
.post('/autoTradeOnOff',controller.autoTradeOnOff)
.post('/tradeProfitPaths', controller.tradeProfitPaths)
.get('/listPlacedTrade', controller.listPlacedTrade)
.get('/viewPlacedTrade/:_id', controller.viewPlacedTrade)
.put('/activeBlockvPlacedTrade', controller.activeBlockvPlacedTrade)
.delete('/deletePlacedTrade', controller.deletePlacedTrade)
.post('/cancelledOrder/:_id', controller.cancelledOrder)
.post('/listPlacedTradeWithFilter', controller.listPlacedTradeWithFilter)
.post('/listPlacedTradeWithFilterForParticularUser', controller.listPlacedTradeWithFilterForParticularUser)
.post('/allListPlacedTradeWithFilter',controller.allListPlacedTradeWithFilter)
.get('/getDataAutoTradeOnOff', controller.getDataAutoTradeOnOff)
.post('/sniperBotOnOff',controller.sniperBotOnOff)
.get('/getDataSniperBotOnOff', controller.getDataSniperBotOnOff)
.get('/script13', controller.script13)
.get('/script14', controller.script14)