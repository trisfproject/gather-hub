import * as motion from "motion/react-client"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center container py-12">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <span className="text-muted-foreground uppercase tracking-widest text-sm font-medium mb-4 block">
          Two Decades, The Next Chapter
        </span>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-primary mb-6">
          KOMITKABE Gathering XXVI
        </h1>
        <p className="text-xl text-secondary max-w-2xl mx-auto">
          Celebrating Our Journey, Shaping What Comes Next
        </p>
      </motion.div>
    </main>
  );
}
