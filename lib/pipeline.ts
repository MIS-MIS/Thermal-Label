import { pipeline } from "@xenova/transformers";

type PipelineTask = Parameters<typeof pipeline>[0];

// Use the Singleton pattern to enable lazy construction of the pipeline.
// NOTE: We wrap the class in a function to prevent code duplication (see below).
const P = () => class PipelineSingleton {
  static task: PipelineTask = 'text-classification';
  static model = "Xenova/toxic-bert";
  static instance: any = null;

  static async getInstance(progress_callback = undefined) {
    if (this.instance === null) {
      this.instance = pipeline(this.task, this.model, { progress_callback });
    }
    return this.instance;
  }
}

type PipelineSingletonType = ReturnType<typeof P>;

let PipelineSingleton: PipelineSingletonType;
if (process.env.NODE_ENV !== 'production') {
  // When running in development mode, attach the pipeline to the
  // global object so that it's preserved between hot reloads.
  // For more information, see https://vercel.com/guides/nextjs-prisma-postgres
  if (!(global as any).PipelineSingleton) {
    (global as any).PipelineSingleton = P();
  }
  PipelineSingleton = (global as any).PipelineSingleton;
} else {
  PipelineSingleton = P();
}
export default PipelineSingleton;