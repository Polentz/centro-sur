<?php
/**
 * Site footer: copyright, address and contacts, edited in the Panel under Site.
 * Sits inside #smooth-content so it scrolls with the page.
 */
$socials = $site->socials()->toStructure();
$names = [
    'instagram' => 'Instagram',
    'facebook' => 'Facebook',
    'youtube' => 'YouTube',
    'linkedin' => 'LinkedIn',
    'x' => 'X',
];
?>
<footer class="footer">
    <p class="footer-copyright">© <?= date('Y') ?> <?= $site->title()->or('Centro Sur')->esc() ?></p>

    <?php if ($site->address()->isNotEmpty()): ?>
        <address class="footer-address"><?= nl2br($site->address()->esc()) ?></address>
    <?php endif ?>

    <?php if ($site->email()->isNotEmpty() || $socials->isNotEmpty()): ?>
        <ul class="footer-contacts" aria-label="Contact">
            <?php if ($site->email()->isNotEmpty()): ?>
                <li><?= Html::email($site->email()->value()) ?></li>
            <?php endif ?>
            <?php if ($socials->isNotEmpty()): ?>
                <li>
                    <ul class="footer-socials">
                        <?php foreach ($socials as $social): ?>
                            <?php $platform = $social->platform()->value() ?>
                            <li>
                                <?php if (isset($names[$platform])): ?>
                                    <a class="footer-icon" href="<?= $social->url()->esc('attr') ?>" target="_blank" rel="noopener"
                                        aria-label="<?= $names[$platform] ?>">
                                        <?= snippet('social-icon', ['platform' => $platform]) ?>
                                    </a>
                                <?php else: ?>
                                    <a href="<?= $social->url()->esc('attr') ?>" target="_blank"
                                        rel="noopener"><?= $social->label()->or('Link')->esc() ?></a>
                                <?php endif ?>
                            </li>
                        <?php endforeach ?>
                    </ul>
                </li>
            <?php endif ?>
        </ul>
    <?php endif ?>
</footer>