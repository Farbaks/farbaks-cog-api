import { AssessmentsSchema } from './assessments.schema';

describe('AssessmentsSchema', () => {
  it('should be defined', () => {
    expect(new AssessmentsSchema()).toBeDefined();
  });
});
