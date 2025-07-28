import { Request, Response, NextFunction } from 'express';
import * as pointOfSaleService from '../services/pointOfSale.service';
import { AppError } from '../utils/appError';

export const createPointOfSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = req.body;
    const pointOfSale = await pointOfSaleService.createPointOfSaleService(data);
    res.status(201).json({ success: true, data: pointOfSale });
  } catch (err) {
    next(err);
  }
};

export const updatePointOfSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError('ID invalide', 400);

    const pointOfSale = await pointOfSaleService.updatePointOfSaleService(id, req.body);
    res.status(200).json({ success: true, data: pointOfSale });
  } catch (err) {
    next(err);
  }
};

export const deletePointOfSale = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) throw new AppError('ID invalide', 400);

    await pointOfSaleService.deletePointOfSaleService(id);
    res.status(204).json({ success: true });
  } catch (err) {
    next(err);
  }
};

export const getPointsOfSaleByBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = Number(req.params.businessId);
    if (isNaN(businessId)) throw new AppError('ID invalide', 400);

    const points = await pointOfSaleService.getPointsOfSaleByBusinessService(businessId);
    res.status(200).json({ success: true, data: points });
  } catch (err) {
    next(err);
  }
};

export const getPointOfSaleByBusiness = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const businessId = Number(req.params.businessId);
    const pointOfSaleId = Number(req.params.pointOfSaleId);

    if (isNaN(businessId) || isNaN(pointOfSaleId)) {
      throw new AppError('ID invalide', 400);
    }

    const point = await pointOfSaleService.getPointOfSaleByBusinessService(businessId, pointOfSaleId);
    if (!point) throw new AppError('Point de vente introuvable', 404);

    res.status(200).json({ success: true, data: point });
  } catch (err) {
    next(err);
  }
};