<nav class="nav" aria-label="Main">
    <h1 class="site-title nav-item">
        <a href="<?= $site->url() ?>">
            <?= $site->title() ?>
        </a>
    </h1>
    <ul class="nav-wrapper">
        <?php foreach ($site->children()->listed()->not('home') as $page): ?>
            <li class="nav-item">
                <a href="<?= $page->url() ?>" <?= $page->isOpen() ? ' aria-current="page"' : '' ?>><?= $page->title()->esc() ?></a>
            </li>
        <?php endforeach ?>
    </ul>
</nav>