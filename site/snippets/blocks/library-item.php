<?= snippet('index-entry', [
    'block' => $block,
    'cells' => [
        'title' => $block->title()->value(),
        'author' => $block->author()->value(),
        'format' => $block->format()->value(),
        'year' => $block->year()->value(),
    ],
    'info' => $block->info()->value(),
]) ?>