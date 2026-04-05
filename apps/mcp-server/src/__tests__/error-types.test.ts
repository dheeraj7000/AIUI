import { describe, it, expect } from 'vitest';
import { ToolError, NotFoundError, ValidationError, DatabaseError } from '../lib/errors';

describe('ToolError', () => {
  it('is an instance of Error', () => {
    const err = new ToolError('something went wrong');
    expect(err).toBeInstanceOf(Error);
  });

  it('preserves the message', () => {
    const err = new ToolError('something went wrong');
    expect(err.message).toBe('something went wrong');
  });

  it('has name "ToolError"', () => {
    const err = new ToolError('fail');
    expect(err.name).toBe('ToolError');
  });

  it('defaults code to TOOL_ERROR', () => {
    const err = new ToolError('fail');
    expect(err.code).toBe('TOOL_ERROR');
  });

  it('accepts a custom code', () => {
    const err = new ToolError('fail', 'CUSTOM');
    expect(err.code).toBe('CUSTOM');
  });
});

describe('NotFoundError', () => {
  it('is an instance of Error', () => {
    const err = new NotFoundError('Project', 'abc-123');
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of ToolError', () => {
    const err = new NotFoundError('Project', 'abc-123');
    expect(err).toBeInstanceOf(ToolError);
  });

  it('has code NOT_FOUND', () => {
    const err = new NotFoundError('Project', 'abc-123');
    expect(err.code).toBe('NOT_FOUND');
  });

  it('preserves the message with resource and id', () => {
    const err = new NotFoundError('Project', 'abc-123');
    expect(err.message).toBe('Project not found: abc-123');
  });

  it('has name "NotFoundError"', () => {
    const err = new NotFoundError('Project', 'abc-123');
    expect(err.name).toBe('NotFoundError');
  });
});

describe('ValidationError', () => {
  it('is an instance of Error', () => {
    const err = new ValidationError('invalid input');
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of ToolError', () => {
    const err = new ValidationError('invalid input');
    expect(err).toBeInstanceOf(ToolError);
  });

  it('has code VALIDATION_ERROR', () => {
    const err = new ValidationError('invalid input');
    expect(err.code).toBe('VALIDATION_ERROR');
  });

  it('preserves the message', () => {
    const err = new ValidationError('invalid input');
    expect(err.message).toBe('invalid input');
  });

  it('has name "ValidationError"', () => {
    const err = new ValidationError('invalid input');
    expect(err.name).toBe('ValidationError');
  });
});

describe('DatabaseError', () => {
  it('is an instance of Error', () => {
    const err = new DatabaseError('connection failed');
    expect(err).toBeInstanceOf(Error);
  });

  it('is an instance of ToolError', () => {
    const err = new DatabaseError('connection failed');
    expect(err).toBeInstanceOf(ToolError);
  });

  it('has code DATABASE_ERROR', () => {
    const err = new DatabaseError('connection failed');
    expect(err.code).toBe('DATABASE_ERROR');
  });

  it('preserves the message', () => {
    const err = new DatabaseError('connection failed');
    expect(err.message).toBe('connection failed');
  });

  it('has name "DatabaseError"', () => {
    const err = new DatabaseError('connection failed');
    expect(err.name).toBe('DatabaseError');
  });
});
