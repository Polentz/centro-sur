<?php
$items = $page->entries()->toBlocks();
$fallback = $page->illustration()->toFile();
$query = get('q');
$results = $items
    ->when($query, function ($query) {
        return $this->search($query, 'title|author|format|year', ['words' => true]);
    });
?>
<?= snippet('head') ?>
<?= snippet('header') ?>
<?= snippet('nav') ?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>

            <section class="library-index">
                <div class="library-heading">
                    <p><?= $page->title()->esc() ?> · <?= $items->count() ?> <?= t('library.items') ?></p>
                    <form class="search-wrapper" action="<?= $page->url() ?>" autocomplete="off">
                        <?php if ($results->isEmpty()): ?>
                            <p class="search-null">
                                <?= t('search.null') ?>
                            </p>
                            <input id="search" type="search" class="search-input null" name="q" value="<?= $query ?>">
                        <?php else: ?>
                            <input id="search" type="search" class="search-input" name="q" value="<?= $query ?>">
                        <?php endif ?>
                        <label for="search" class="search-label">
                            <span><?= t('library.search') ?></span>
                        </label>
                        <a href="<?= $page->url() ?>" type="reset" class="search-reset">Clear</a>
                    </form>
                </div>

                <?php if ($items->isNotEmpty()): ?>
                    <ul class="library-list">
                        <?php if ($query): ?>
                            <?php if ($results->isNotEmpty()): ?>
                                <?php foreach ($results as $result): ?>
                                    <?= snippet('blocks/library-item', ['block' => $result, 'fallback' => $fallback]) ?>
                                <?php endforeach ?>
                            <?php elseif ($results->isEmpty()): ?>
                                <?php foreach ($items as $item): ?>
                                    <?= snippet('blocks/library-item', ['block' => $item, 'fallback' => $fallback]) ?>
                                <?php endforeach ?>
                            <?php endif ?>
                        <?php else: ?>
                            <?php foreach ($items as $item): ?>
                                <?= snippet('blocks/library-item', ['block' => $item, 'fallback' => $fallback]) ?>
                            <?php endforeach ?>
                        <?php endif ?>
                    </ul>
                <?php endif ?>
            </section>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>

<?= snippet('language-menu') ?>
<?= snippet('foot') ?>