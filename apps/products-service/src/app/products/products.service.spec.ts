import { Test, TestingModule } from "@nestjs/testing";
import { ProductsService } from './products.service';
import { NotFoundException, Logger } from "@nestjs/common";
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsService', () => {
    let service: ProductsService;

    // Mock PrismaService
    const mockPrismaService = {
        product: {
            findMany: jest.fn(),
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
        },
    };

    beforeAll(() => {
        // Suppress logger output during tests
        jest.spyOn(Logger.prototype, 'log').mockImplementation();
        jest.spyOn(Logger.prototype, 'error').mockImplementation();
        jest.spyOn(Logger.prototype, 'warn').mockImplementation();
        jest.spyOn(Logger.prototype, 'debug').mockImplementation();
        jest.spyOn(Logger.prototype, 'verbose').mockImplementation();
    });

    beforeEach( async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ProductsService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        service = module.get<ProductsService>(ProductsService);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    // findAll() TEST
    it('should return all products', () => {
    const products = service.findAll();
    expect(products.length).toBeGreaterThan(0);
    })

    // findOne() TEST
    it('should return a product by ID', () => {
    const product = service.findOne(1);
    expect(product).toHaveProperty('id', 1);
    });

    it('should throw NotFoundException for invalid ID', () => {
    expect(() => service.findOne(999)).toThrow(NotFoundException);
    });

    // create() TEST
    it('should create a new product', () => {
    const newProduct = service.create({ name: 'Test', quantity: 10 });
    expect(newProduct).toHaveProperty('id');
    expect(newProduct.name).toBe('Test');
    });

    // update() TEST
    it('should update a product', () => {
    const updated = service.update(1, { name: 'Updated' });
    expect(updated.name).toBe('Updated');
    });

    it('should throw NotFoundException for update invalid ID', () => {
    expect(() => service.update(999, { name: 'X' })).toThrow(NotFoundException);
    });

    // checkAvailability() TEST
    it('should return true if quantity is enough', () => {
    expect(service.checkAvailability(1, 1)).toBe(true);
    });

    it('should return false if quantity is not enough', () => {
    expect(service.checkAvailability(1, 999)).toBe(false);
    });

    // decreaseQuantity() TEST
    it('should decrease quantity of a product', () => {
    const productBefore = service.findOne(1);
    const oldQuantity = productBefore.quantity;

    service.decreaseQuantity(1, 1);
    const productAfter = service.findOne(1);
    expect(productAfter.quantity).toBe(oldQuantity - 1);
    });

    it('should throw error if quantity is insufficient', () => {
    expect(() => service.decreaseQuantity(1, 999)).toThrow('Insufficient quantity');
    });

    });