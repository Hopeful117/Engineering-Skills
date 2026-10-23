# Story Closure Preflight

## Mission

Determine whether an implemented Story is safe to deliver and identify the exact
Git and pull-request operations required.

## Inputs

* Story identifier and canonical Story artifact;
* repository policy and contribution instructions;
* current Git status, branch, remotes, and target branch;
* implementation, review, and validation artifacts.

## Objectives

* Confirm that implementation and required validation are complete.
* Detect uncommitted, unrelated, staged, or untracked changes.
* Identify or propose the dedicated branch name.
* Determine the repository's commit, PR, and merge conventions.
* List each operation requiring explicit human confirmation.

## Deliverable

Produce a `Story Closure Preflight` containing:

* Story and repository identity;
* current branch and target branch;
* working-tree classification;
* proposed branch, commit, PR, and merge messages;
* required checks and their observed status;
* blockers and confirmation gates.

## Stop Condition

Stop if the Story, target branch, working-tree ownership, or required validation
cannot be established safely.
