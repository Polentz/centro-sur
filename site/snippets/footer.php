<?php
use Kirby\Toolkit\Html;
$socials = $site->socials()->toStructure();
$names = [
    'instagram' => 'Instagram',
    'x' => 'X',
    'facebook' => 'Facebook',
    'tiktok' => 'TikTok',
    'substack' => 'Substack',
    'linkedin' => 'LinkedIn',
    'youtube' => 'YouTube',
    'vimeo' => 'Vimeo',
];
?>
<footer class="footer">
    <div class="footer-contacts" aria-label="Contact">
        <?php if ($site->address()->isNotEmpty()): ?>
            <address class="footer-address">
                <?= nl2br($site->address()->esc()) ?>
            </address>
        <?php endif ?>
        <?php if ($site->email()->isNotEmpty()): ?>
            <p class=" footer-email">
                <?= Html::email($site->email()->value()) ?>
            </p>
        <?php endif ?>
        <?php if ($socials->isNotEmpty()): ?>
            <ul class="footer-socials">
                <?php foreach ($socials as $social): ?>
                    <?php $platform = $social->platform()->value() ?>
                    <li class="social-icon-wrapper">
                        <?php if (isset($names[$platform])): ?>
                            <a href="<?= $social->url()->esc('attr') ?>" target="_blank" rel="noopener"
                                aria-label="<?= $names[$platform] ?>">
                                <?= snippet('social-icon', ['platform' => $platform]) ?>
                            </a>
                        <?php else: ?>
                            <a href="<?= $social->url()->esc('attr') ?>" target="_blank" rel="noopener">
                                <?= $social->label()->or('Link')->esc() ?>
                            </a>
                        <?php endif ?>
                    </li>
                <?php endforeach ?>
            </ul>
        <?php endif ?>
    </div>
    <div class="footer-wrapper">
        <?php foreach ($site->children()->listed()->filterBy('intendedTemplate', 'text') as $page): ?>
            <a href="<?= $page->url() ?>" <?= $page->isOpen() ? ' aria-current="page"' : '' ?>>
                <?= $page->title()->esc() ?>
            </a>
        <?php endforeach ?>
        <p class="footer-copyright">©
            <?= date('Y') ?>
            <?= $site->title()->esc() ?>
        </p>
    </div>
</footer>