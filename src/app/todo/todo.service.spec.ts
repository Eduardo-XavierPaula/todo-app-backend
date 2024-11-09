import { Test, TestingModule } from '@nestjs/testing';
import { TodoService } from './todo.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TodoEntity } from './entity/todo.entity';
import { Repository } from 'typeorm';
import { CreateTodoDto } from './dto/create-todo.dto';
import { NotFoundException } from '@nestjs/common';
import { UpdateTodoDto } from './dto/update-todo.dto';

const TodoEntityList: TodoEntity[] = [
  new TodoEntity({ task: 'task-1', isDone: 0 }),
  new TodoEntity({ task: 'task-2', isDone: 0 }),
  new TodoEntity({ task: 'task-3', isDone: 0 }),
];

const updatedTodoEntityItem = new TodoEntity({
  task: 'task-1-updated',
  isDone: 1,
});

describe('TodoService', () => {
  let todoService: TodoService;
  let todoRepository: Repository<TodoEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodoService,
        {
          provide: getRepositoryToken(TodoEntity),
          useValue: {
            find: jest.fn().mockResolvedValue(TodoEntityList),
            findOneOrFail: jest.fn().mockResolvedValue(TodoEntityList[0]),
            create: jest.fn().mockReturnValue(TodoEntityList[0]),
            save: jest.fn().mockResolvedValue(TodoEntityList[0]),
            merge: jest.fn().mockReturnValue(updatedTodoEntityItem),
            softDelete: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    todoService = module.get<TodoService>(TodoService);
    todoRepository = module.get<Repository<TodoEntity>>(
      getRepositoryToken(TodoEntity),
    );
  });

  it('should be defined', () => {
    expect(todoService).toBeDefined();
    expect(todoRepository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return a todo list entity successfully', async () => {
      //Act
      const result = await todoService.findAll();

      //Assert
      expect(result).toEqual(TodoEntityList);
      expect(todoRepository.find).toHaveBeenCalledTimes(1);
    });
    it('should throw an exception', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'find')
        .mockRejectedValueOnce(new Error('Erro'));
      //Assert
      expect(todoService.findAll()).rejects.toThrow(Error('Erro'));
    });
  });
  describe('findOneOrFail', () => {
    it('should return a todo item successfully', async () => {
      //Act
      const result = await todoService.findOneOrFail('1');

      //Assert
      expect(result).toEqual(TodoEntityList[0]);
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });
    it('should throw a not found exception', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());
      //Assert
      expect(todoService.findOneOrFail('1')).rejects.toThrow(NotFoundException);
    });
  });
  describe('create', () => {
    it('should create a new todo item successfully', async () => {
      //Arrange
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };

      //Act
      const result = await todoService.create(data);

      //Assert
      expect(result).toEqual(TodoEntityList[0]);
      expect(todoRepository.create).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });
    it('should throw an exception', () => {
      //Arrange
      const data: CreateTodoDto = {
        task: 'task-1',
        isDone: 0,
      };
      //Act
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());
      //Assert
      expect(todoService.create(data)).rejects.toThrow();
    });
  });
  describe('update', () => {
    it('should update a todo item successfully', async () => {
      //Arrange
      const data: UpdateTodoDto = {
        task: 'task-1-updated',
        isDone: 1,
      };
      jest
        .spyOn(todoRepository, 'save')
        .mockResolvedValueOnce(updatedTodoEntityItem);
      //Act
      const result = await todoService.update('1', data);

      //Assert
      expect(result).toEqual(updatedTodoEntityItem);
      expect(todoRepository.merge).toHaveBeenCalledTimes(1);
      expect(todoRepository.save).toHaveBeenCalledTimes(1);
    });

    it('should throw a not found exception', () => {
      //Arrange
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());

      const data: UpdateTodoDto = {
        task: 'task-1-updated',
        isDone: 1,
      };
      //Assert
      expect(todoService.update('1', data)).rejects.toThrow(NotFoundException);
    });

    it('should throw an exception', () => {
      //Arrange
      const data: UpdateTodoDto = {
        task: 'task-1-updated',
        isDone: 1,
      };

      //Act
      jest.spyOn(todoRepository, 'save').mockRejectedValueOnce(new Error());
      //Assert
      expect(todoService.update('1', data)).rejects.toThrow();
    });
  });
  describe('deleteById', () => {
    it('should delete a todo item successfully', async () => {
      //Act
      const result = await todoService.deleteById('1');

      //Assert
      expect(result).toBeUndefined();
      expect(todoRepository.softDelete).toHaveBeenCalledTimes(1);
      expect(todoRepository.findOneOrFail).toHaveBeenCalledTimes(1);
    });
    it('should throw a not found exception', () => {
      jest
        .spyOn(todoRepository, 'findOneOrFail')
        .mockRejectedValueOnce(new Error());
      expect(todoService.deleteById('1')).rejects.toThrow(NotFoundException);
    });
  });
});
