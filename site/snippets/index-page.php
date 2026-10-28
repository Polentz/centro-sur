<?php
/**
 * Shared layout for list pages (library, projects):
 * split sections on top, then a searchable accordion list of blocks.
 *
 * @var string $item    Block snippet used for each entry, e.g. 'blocks/library-item'
 * @var string $search  Block fields to search, e.g. 'title|author'
 * @var string $count   Translation key for the item count label
 */
$items = $page->entries()->toBlocks();
$query = get('q');
$results = $query ? $items->search($query, $search, ['words' => true]) : $items;
// No match: show the full list under the "no results" message
$list = $results->isNotEmpty() ? $results : $items;
?>

<div id="smooth-wrapper">
    <div id="smooth-content">
        <main class="main" data-snap>
            <?php foreach ($page->sections()->toBlocks()->values() as $index => $block): ?>
                <?= snippet('blocks/split', ['block' => $block, 'index' => $index]) ?>
            <?php endforeach ?>
            <?php if ($items->isNotEmpty()): ?>
                <section class="index-section">
                    <div class="index-heading">
                        <p><?= $page->title()->esc() ?> · <?= $items->count() ?>     <?= t($count) ?></p>
                        <form class="search-wrapper" action="<?= $page->url() ?>" autocomplete="off">
                            <?php if ($results->isEmpty()): ?>
                                <p class="search-null">
                                    <?= t('search.null') ?>
                                </p>
                            <?php endif ?>
                            <input id="search" type="search" class="search-input<?= $results->isEmpty() ? ' null' : '' ?>"
                                name="q" value="<?= esc($query ?? '', 'attr') ?>">
                            <label for="search" class="search-label">
                                <span><?= t('library.search') ?></span>
                            </label>
                            <a href="<?= $page->url() ?>" type="reset" class="search-reset">Clear</a>
                        </form>
                    </div>
                    <ul class="index-list">
                        <?php foreach ($list as $entry): ?>
                            <?= snippet($item, ['block' => $entry]) ?>
                        <?php endforeach ?>
                    </ul>
                </section>
            <?php endif ?>
        </main>
        <?= snippet('footer') ?>
    </div>
</div>