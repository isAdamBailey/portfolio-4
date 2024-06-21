---
title: Generators In PHP
date: 2022-08-10
description: Get up and running with generators in PHP.
---

# Generators In PHP

Get up and running with generators in PHP.

## Generators!

According to [the official documentation on generators](https://www.php.net/manual/en/language.generators.overview.php):

"Generators provide an easy way to implement simple iterators without the overhead or complexity
of implementing a class that implements the Iterator interface".

If that didn't make any sense to you, that's fine. It doesn't to me either.

A better way of explaining it, is that generators allow you to perform a foreach over a large,
even **very** large dataset, without committing anything to memory.

## The Problem

If you need to create millions of records, or even just needing to iterate over a million items in an array, you'll run
into php memory limits. PHP is trying to load every item into its internal memory. If you tried to create a million
users in Laravel using a factory:

```php
factory(App\User::class, 1000000)->create();
```       

You'd run out of memory pretty quick. There are ways we can try to handle this, for instance using `chunk()`, but that
would still load records into memory, even if the usage has been reduced.

## Generators To The Rescue!

To create a million users in Laravel using a generator, let's create a generator that accepts a number of records as an
argument, then a for-loop that iterates creating a user.

```php
function generateUsers(int $times)
{
    for ($i = 0; $i < $times; $i++) {
        yield factory(App\User::class)->create();
    }
}
```

The first thing you should notice is that yield keyword. It should be used like return, but instead of stopping
execution of the function and returning, yield instead provides a value to the code looping over the generator and
pauses execution of the generator function. $i is also preserved between yields.

When we use this method we can assign the values to a variable:

```php
$users = generateUsers(1000000);
```

Now, if you want the first item of this generator, you cannot just do `$users[0]`, because an array won't be returned from the generator, it will be a new object of the internal Generator class.

You might have noticed that none of these users have been persisted yet to the database. However, when you grab the
first iteration with `$user->current();`, the User gets returned and is persisted to the database. Continue on the iteration with:

```php
$user->next() 
```    

Great! Now if we run this generator in a `foreach()`, we'll see them populate the database without anything in memory:

```php
foreach (generateUsers(1000000) as $user) {
    echo $user->id;
}
```

## Conclusion

Generators might not make sense for most situations. However, now and then, we'll need to parse a large file, or import
thousands of records. This could certainly cause a php memory failure and that would be no good. Using generators takes
the overhead off of parsing very large datasets.
