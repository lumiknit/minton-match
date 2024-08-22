
/**
 * The type of the input struct
 */
export type InputStruct = {
	/** Male player count */
	mPlayers: string[];
	/** Female player count */
	fPlayers: string[];
	/** Number of court */
	numCourts: number;

	/** Male fun game count */
	mFunGames: number;

	/** Male hard game count */
	mHardGames: number;

	/** Female fun game count */
	fFunGames: number;

	/** Female hard game count */
	fHardGames: number;

	/** Mixed fun game count */
	xFunGames: number;

	/** Mixed hard game count */
	xHardGames: number;
};
