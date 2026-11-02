import type { BodyView } from '../../api/anatomy'

/**
 * Hand-drawn SVG geometry for the body map, in a 200 × 440 viewBox.
 *
 * Only the viewer's left half (x ≤ 100) is drawn; BodyMap mirrors every
 * path across x = 100 to produce the other side. Muscle ids match the ids
 * served by GET /api/anatomy/muscles.
 */

export const VIEWBOX = { width: 200, height: 440 } as const

export interface MuscleShape {
  id: string
  paths: string[]
}

export interface BodyFigure {
  silhouette: string
  /** Head drawn separately so the front view can show a face outline. */
  head: string
  muscles: MuscleShape[]
  /** Non-interactive anatomical detail lines (separations, striations). */
  details: string[]
}

const SILHOUETTE =
  'M100 50 L92 50 C92 54 92 57 92 60 C84 64 70 65 60 67 C50 70 45 78 44 88 ' +
  'C41 100 37 112 36 125 C34 138 32 150 31 165 C29 180 27 195 26 210 ' +
  'C25 220 24 228 27 234 C30 238 34 236 35 230 C37 222 38 214 40 205 ' +
  'C44 190 49 175 52 160 C54 150 56 140 58 128 L60 112 C62 125 66 140 68 160 ' +
  'C68 175 64 188 64 200 C63 225 65 255 68 280 C70 295 72 305 72 315 ' +
  'C72 335 74 360 77 385 C78 398 78 408 78 415 C76 420 70 425 72 429 ' +
  'L96 429 C97 420 95 412 95 405 C96 385 97 360 96 335 C96 318 95 305 96 295 ' +
  'C97 270 98 245 99 225 L100 216 Z'

const HEAD = 'M100 10 C88 10 83 20 83 31 C83 41 88 50 94 53 L100 54 Z'

const FRONT: BodyFigure = {
  silhouette: SILHOUETTE,
  head: HEAD,
  muscles: [
    { id: 'neck', paths: ['M90 47 C92 54 95 60 99 66 L96 68 C92 63 89 57 88 50 Z'] },
    { id: 'traps', paths: ['M91 56 C85 61 75 63 64 66 C73 68 83 68 93 65 C92 62 91 59 91 56 Z'] },
    {
      id: 'delts',
      paths: [
        'M62 67 C52 68 46 76 45 88 C45 96 46 102 48 106 C52 100 56 94 60 88 C63 82 66 76 70 71 C67 68 65 67 62 67 Z',
      ],
    },
    {
      id: 'chest',
      paths: [
        'M72 71 C67 77 63 86 62 96 C65 104 72 108 82 108 C90 108 96 106 99 104 L99 70 C90 69 80 69 72 71 Z',
      ],
    },
    {
      id: 'biceps',
      paths: ['M46 106 C41 114 39 126 40 138 C42 144 47 146 52 143 C57 134 59 122 59 111 C57 104 52 101 46 106 Z'],
    },
    {
      id: 'forearms',
      paths: [
        'M39 149 C35 161 33 174 32 188 C31 198 30 204 32 208 L39 208 C42 198 45 186 48 174 C51 164 53 156 54 150 C49 146 43 146 39 149 Z',
      ],
    },
    { id: 'abs', paths: ['M88 111 L99 111 L99 192 C95 190 91 184 89 176 C87 160 87 130 88 111 Z'] },
    {
      id: 'obliques',
      paths: [
        'M85 111 C76 112 68 116 63 121 C65 135 67 150 67 165 C71 175 78 182 87 188 C86 175 85 160 85 145 C85 130 85 118 85 111 Z',
      ],
    },
    {
      id: 'quads',
      paths: [
        'M70 199 C66 215 65 240 67 262 C69 280 73 292 80 298 C86 299 91 294 93 286 C95 270 94 252 91 240 C89 228 90 216 93 208 C86 202 78 198 70 198 Z',
      ],
    },
    { id: 'adductors', paths: ['M95 210 C91 218 91 230 93 243 C96 238 98 230 99 222 L99 212 Z'] },
    {
      id: 'shins',
      paths: ['M76 318 C74 335 75 355 78 375 C79 385 80 392 82 396 C84 385 85 370 85 350 C85 335 83 322 80 312 Z'],
    },
    { id: 'calves', paths: ['M88 315 C93 325 95 340 94 355 C93 365 91 372 89 376 C87 360 86 340 86 325 Z'] },
  ],
  details: [
    // pectoral fibres
    'M73 80 Q86 87 98 89',
    'M66 92 Q82 98 98 98',
    // abdominal tendinous lines
    'M88 129 L99 129',
    'M88 147 L99 147',
    'M88.5 165 L99 165',
    // delt / biceps separation
    'M50 99 Q55 93 60 88',
    // quad separations: rectus femoris and vastus medialis
    'M80 206 C78 230 79 255 82 280',
    'M92 262 C86 270 84 282 86 292',
    // knee cap
    'M80 304 C80 297 92 297 92 304 C92 311 80 311 80 304 Z',
  ],
}

const BACK: BodyFigure = {
  silhouette: SILHOUETTE,
  head: HEAD,
  muscles: [
    {
      id: 'traps',
      paths: [
        'M99 50 C96 56 92 60 86 63 C78 66 70 67 64 69 C72 74 82 80 89 92 C94 100 97 110 99 126 Z',
      ],
    },
    {
      id: 'delts',
      paths: [
        'M62 68 C52 70 46 78 45 90 C46 98 47 104 49 108 C53 100 58 90 63 82 C65 77 67 72 64 69 Z',
      ],
    },
    { id: 'upper-back', paths: ['M70 76 C66 84 66 92 70 100 C78 104 86 102 91 96 C87 88 80 80 70 76 Z'] },
    {
      id: 'lats',
      paths: [
        'M66 102 C63 114 64 126 66 138 C70 150 78 160 88 166 C91 158 93 150 94 142 C92 130 90 118 89 106 C82 106 74 105 66 102 Z',
      ],
    },
    { id: 'lower-back', paths: ['M91 140 C89 155 88 170 90 186 L99 189 L99 130 C96 132 93 136 91 140 Z'] },
    {
      id: 'triceps',
      paths: ['M47 109 C41 117 39 128 40 140 C42 145 47 147 52 144 C57 135 59 123 59 113 C57 106 52 104 47 109 Z'],
    },
    {
      id: 'forearms',
      paths: [
        'M39 151 C35 163 33 176 32 190 C31 199 30 204 32 208 L39 208 C42 198 45 186 48 174 C51 165 53 157 54 152 C49 148 43 148 39 151 Z',
      ],
    },
    {
      id: 'glutes',
      paths: ['M70 189 C64 197 64 212 68 224 C76 232 88 232 99 228 L99 197 C92 189 82 185 70 189 Z'],
    },
    {
      id: 'hamstrings',
      paths: [
        'M68 232 C66 250 67 268 70 285 C74 294 80 298 86 298 C91 294 94 286 95 276 C96 262 96 250 96 238 C88 238 76 238 68 232 Z',
      ],
    },
    {
      id: 'calves',
      paths: [
        'M77 312 C73 325 73 342 76 356 C79 366 83 370 87 368 C91 362 94 352 95 340 C96 326 92 314 87 308 C83 308 80 309 77 312 Z',
      ],
    },
  ],
  details: [
    // scapula outline
    'M72 82 Q80 88 86 98',
    // triceps horseshoe
    'M47 124 Q51 133 56 126',
    // hamstring split (biceps femoris / semis)
    'M82 242 C82 262 82 280 83 296',
    // gastrocnemius heads
    'M85 314 C85 330 85 345 85 362',
    // achilles
    'M85 372 L86 410',
  ],
}

export const FIGURES: Record<BodyView, BodyFigure> = { front: FRONT, back: BACK }

/** Muscle ids that can be selected on a given view. */
export function musclesOnView(view: BodyView): Set<string> {
  return new Set(FIGURES[view].muscles.map((m) => m.id))
}
